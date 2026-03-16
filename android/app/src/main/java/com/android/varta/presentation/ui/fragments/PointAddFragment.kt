package com.android.varta.presentation.ui.fragments

import android.app.Dialog
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.preference.PreferenceManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.android.varta.R
import com.android.varta.databinding.FragmentPointAddBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.PointAddRequest
import com.android.varta.presentation.ui.extensions.hideLoadingDialog
import com.android.varta.presentation.ui.extensions.showLoadingDialog
import com.android.varta.presentation.viewmodel.PointViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker

@AndroidEntryPoint
class PointAddFragment : Fragment() {

    private val viewModel: PointViewModel by viewModels()

    private var _binding: FragmentPointAddBinding? = null
    private val binding get() = _binding!!

    private var loadingDialog: Dialog? = null

    private var currentMarker: Marker? = null
    private var selectedCoordinates: GeoPoint? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ctx = requireContext().applicationContext
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx))
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPointAddBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        initMap()
        setupUI()
        observeViewModel()
    }

    private fun initMap() {
        val map = binding.map
        map.setTileSource(TileSourceFactory.MAPNIK)
        map.setMultiTouchControls(true)

        map.zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)

        val mapController = map.controller
        mapController.setZoom(12.0)
        val startPoint = GeoPoint(49.9935, 36.2304)
        mapController.setCenter(startPoint)

        val mapEventsReceiver = object : MapEventsReceiver {
            override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                handleMapClick(p)
                return true
            }

            override fun longPressHelper(p: GeoPoint?): Boolean {
                handleMapClick(p)
                return false
            }
        }

        val mapEventsOverlay = MapEventsOverlay(mapEventsReceiver)
        map.overlays.add(0, mapEventsOverlay)
    }

    private fun handleMapClick(geoPoint: GeoPoint?) {
        if (geoPoint == null) return

        val map = binding.map

        currentMarker?.let { map.overlays.remove(it) }

        val marker = Marker(map)
        marker.infoWindow = null
        marker.position = geoPoint
        marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
        marker.icon = getResizedIcon(R.drawable.map_marker_point, 30)
        marker.setOnMarkerClickListener { _, _ -> true }

        map.overlays.add(marker)
        map.invalidate()

        currentMarker = marker
        selectedCoordinates = geoPoint

        binding.error.visibility = View.INVISIBLE
    }

    private fun getResizedIcon(iconRes: Int, sizeDp: Int): Drawable? {
        val context = context ?: return null
        val drawable = ContextCompat.getDrawable(context, iconRes) ?: return null

        val sizePx = (sizeDp * context.resources.displayMetrics.density).toInt()

        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)

        return BitmapDrawable(context.resources, bitmap)
    }

    private fun setupUI() {
        binding.close.setOnClickListener { findNavController().popBackStack() }

        binding.add.setOnClickListener {
            binding.error.visibility = View.INVISIBLE

            val name = binding.pointName.text.toString().trim()
            val description = binding.description.text.toString().trim()

            var lat: String
            var lon: String
            var coordsString = ""

            if (selectedCoordinates != null) {
                lat = String.format(java.util.Locale.US, "%.7f", selectedCoordinates!!.latitude)
                lon = String.format(java.util.Locale.US, "%.7f", selectedCoordinates!!.longitude)
                coordsString = "$lat, $lon"
            }

            binding.error.visibility = View.INVISIBLE

            viewModel.addPoint(
                PointAddRequest(
                    name = name,
                    coordinates = coordsString,
                    description = description
                )
            )
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.addState.collect { state ->

                    if (state is UiState.Loading) {
                        if (loadingDialog == null) {
                            loadingDialog = showLoadingDialog()
                        }
                    } else {
                        hideLoadingDialog(loadingDialog)
                        loadingDialog = null
                    }

                    when (state) {
                        is UiState.Success -> {
                            binding.error.visibility = View.INVISIBLE
                            setError(false)
                            findNavController().popBackStack()
                        }
                        is UiState.Error -> {
                            binding.error.visibility = View.VISIBLE
                            binding.error.text = state.detail
                            setError(true)
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun setError(isError: Boolean) {
        binding.pointName.setErrorStroke(isError)
        binding.description.setErrorStroke(isError)
    }

    private fun View.setErrorStroke(isError: Boolean) {
        val strokeWidth = if (isError) 2 else 0
        val strokeColor = ContextCompat.getColor(context, R.color.light_red)
        (background as? GradientDrawable)?.setStroke(strokeWidth, strokeColor)
    }

    override fun onResume() {
        super.onResume()
        binding.map.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.map.onPause()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        hideLoadingDialog(loadingDialog)
        loadingDialog = null
        currentMarker = null
        binding.map.onDetach()
        _binding = null
    }
}