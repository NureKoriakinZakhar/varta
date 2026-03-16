package com.android.varta.presentation.ui.fragments

import android.os.Bundle
import android.preference.PreferenceManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.android.varta.R
import com.android.varta.databinding.FragmentMapBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.Point
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.presentation.ui.extensions.showErrorDialog
import com.android.varta.presentation.viewmodel.MapViewModel
import com.android.varta.presentation.viewmodel.PointViewModel
import com.android.varta.presentation.viewmodel.SoldierViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsDisplay
import org.osmdroid.views.overlay.Marker

@AndroidEntryPoint
class MapFragment : Fragment() {

    private val mapViewModel: MapViewModel by activityViewModels()
    private val soldiersViewModel: SoldierViewModel by activityViewModels()
    private val pointsViewModel: PointViewModel by activityViewModels()

    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!

    private val soldierMarkers = mutableListOf<Marker>()
    private val pointMarkers = mutableListOf<Marker>()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        Configuration.getInstance().load(
            requireContext(),
            PreferenceManager.getDefaultSharedPreferences(requireContext())
        )

        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        soldiersViewModel.getAllSoldier()
        pointsViewModel.getAllPoint()

        setupMap()
        observeViewModels()
    }

    private fun setupMap() {
        binding.map.apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER)

            zoomController.display.setPositions(
                false,
                CustomZoomButtonsDisplay.HorizontalPosition.RIGHT,
                CustomZoomButtonsDisplay.VerticalPosition.CENTER
            )

            controller.setZoom(mapViewModel.zoomLevel)
            controller.setCenter(mapViewModel.mapCenter)

            minZoomLevel = 4.0
            maxZoomLevel = 20.0
        }
    }

    private fun observeViewModels() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {

                launch {
                    soldiersViewModel.soldiersState.collect { state ->
                        when (state) {
                            is UiState.Success -> {
                                drawSoldiers(state.data)
                            }
                            is UiState.Error -> {
                                showErrorDialog { soldiersViewModel.getAllSoldier() }
                            }
                            else -> {}
                        }
                    }
                }

                launch {
                    pointsViewModel.evacuationPointsState.collect { state ->
                        when (state) {
                            is UiState.Success -> {
                                drawPoints(state.data)
                            }
                            is UiState.Error -> {
                                showErrorDialog { pointsViewModel.getAllPoint() }
                            }
                            else -> {}
                        }
                    }
                }

            }
        }
    }

    private fun drawSoldiers(soldiers: List<Soldier>) {
        binding.map.overlays.removeAll(soldierMarkers)
        soldierMarkers.clear()

        for (soldier in soldiers) {
            if (soldier.status == "На лікуванні") {
                continue
            }

            val statusIcon = when (soldier.status) {
                "Good" -> R.drawable.map_marker_good
                "Warning" -> R.drawable.map_marker_warning
                "Critical" -> R.drawable.map_marker_critical
                else -> R.drawable.map_marker_critical
            }

            val coords = parseCoordinates(soldier.coordinates)
            if (coords != null) {
                val marker = createMarker(
                    lat = coords.first,
                    lon = coords.second,
                    iconRes = statusIcon,
                    onClick = {
                        val action = MapFragmentDirections.actionMapToSoldierAbout(soldier)
                        findNavController().navigate(action)
                    }
                )
                soldierMarkers.add(marker)
            }
        }

        binding.map.overlays.addAll(soldierMarkers)
        binding.map.invalidate()
    }

    private fun drawPoints(points: List<Point>) {
        binding.map.overlays.removeAll(pointMarkers)
        pointMarkers.clear()

        for (point in points) {
            val coords = parseCoordinates(point.coordinates)
            if (coords != null) {
                val marker = createMarker(
                    lat = coords.first,
                    lon = coords.second,
                    iconRes = R.drawable.map_marker_point,
                    onClick = {
                        val action = MapFragmentDirections.actionMapToPointAbout(point)
                        findNavController().navigate(action)
                    }
                )
                pointMarkers.add(marker)
            }
        }

        binding.map.overlays.addAll(pointMarkers)
        binding.map.invalidate()
    }

    private fun parseCoordinates(coordString: String?): Pair<Double, Double>? {
        if (coordString.isNullOrBlank()) return null
        return try {
            val parts = coordString.split(",")
            if (parts.size >= 2) {
                val lat = parts[0].trim().toDouble()
                val lon = parts[1].trim().toDouble()
                Pair(lat, lon)
            } else null
        } catch (e: Exception) {
            null
        }
    }

    private fun createMarker(lat: Double, lon: Double, iconRes: Int, onClick: () -> Unit): Marker {
        val marker = Marker(binding.map)
        marker.infoWindow = null
        marker.position = GeoPoint(lat, lon)
        marker.icon = getResizedIcon(iconRes, 30)
        marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)

        marker.setOnMarkerClickListener { _, _ ->
            onClick()
            true
        }

        return marker
    }

    private fun getResizedIcon(iconRes: Int, sizeDp: Int): android.graphics.drawable.BitmapDrawable {
        val bitmap = android.graphics.BitmapFactory.decodeResource(resources, iconRes)
        val sizePx = (sizeDp * resources.displayMetrics.density).toInt()
        val resizedBitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, sizePx, sizePx, false)
        return android.graphics.drawable.BitmapDrawable(resources, resizedBitmap)
    }

    override fun onResume() {
        super.onResume()
        binding.map.onResume()
    }

    override fun onPause() {
        super.onPause()
        val center = binding.map.mapCenter as GeoPoint
        val zoom = binding.map.zoomLevelDouble
        mapViewModel.saveMapState(center, zoom)
        binding.map.onPause()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}