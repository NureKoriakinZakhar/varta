package com.android.varta.presentation.ui.fragments

import android.app.Dialog
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Bundle
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
import androidx.navigation.fragment.navArgs
import com.android.varta.R
import com.android.varta.databinding.FragmentPointAboutBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.PointDeleteRequest
import com.android.varta.presentation.ui.extensions.hideLoadingDialog
import com.android.varta.presentation.ui.extensions.showErrorDialog
import com.android.varta.presentation.ui.extensions.showLoadingDialog
import com.android.varta.presentation.ui.extensions.showQuestionDialog
import com.android.varta.presentation.viewmodel.PointViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsDisplay
import org.osmdroid.views.overlay.Marker

@AndroidEntryPoint
class PointAboutFragment : Fragment() {

    private val args: PointAboutFragmentArgs by navArgs()
    private val viewModel: PointViewModel by viewModels()

    private var _binding: FragmentPointAboutBinding? = null
    private val binding get() = _binding!!

    private var loadingDialog: Dialog? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentPointAboutBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        setupMap()
        observeViewModel()
    }

    private fun setupUI() {
        binding.close.setOnClickListener { findNavController().popBackStack() }

        val point = args.evacuationPoint
        binding.apply {
            pointId.text = point.id.toString()
            pointName.text = point.name ?: "-"
            description.text = point.description ?: "-"

            delete.setOnClickListener {
                showQuestionDialog(
                    titleRes = R.string.dialog_delete_point_title,
                    messageRes = R.string.dialog_delete_point_message,
                    yesRes = R.string.dialog_delete_yes,
                    noRes = R.string.dialog_delete_no
                ) {
                    viewModel.deletePoint(PointDeleteRequest(point.id))
                }
            }
        }
    }

    private fun setupMap() {
        val point = args.evacuationPoint

        binding.map.apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER)

            val coordsArray = point.coordinates.split(",")
            if (coordsArray.size == 2) {
                val lat = coordsArray[0].trim().toDoubleOrNull() ?: 0.0
                val lon = coordsArray[1].trim().toDoubleOrNull() ?: 0.0
                val geoPoint = GeoPoint(lat, lon)

                controller.setZoom(12.0)
                controller.setCenter(geoPoint)

                val marker = createMarker(lat, lon, R.drawable.map_marker_point)
                overlays.add(marker)
                invalidate()
            }
        }
    }

    private fun createMarker(lat: Double, lon: Double, iconRes: Int): Marker {
        val marker = Marker(binding.map)
        marker.position = GeoPoint(lat, lon)
        marker.infoWindow = null
        marker.icon = getResizedIcon(iconRes, 30)
        marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)

        return marker
    }

    private fun getResizedIcon(iconRes: Int, sizeDp: Int): Drawable? {
        val drawable = ContextCompat.getDrawable(requireContext(), iconRes) ?: return null
        val sizePx = (sizeDp * resources.displayMetrics.density).toInt()

        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)

        return BitmapDrawable(resources, bitmap)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.deleteState.collect { state ->

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
                            findNavController().popBackStack()
                        }
                        is UiState.Error -> {
                            showErrorDialog {
                                viewModel.deletePoint(PointDeleteRequest(args.evacuationPoint.id))
                            }
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        hideLoadingDialog(loadingDialog)
        loadingDialog = null
        _binding = null
    }
}