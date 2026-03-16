package com.android.varta.presentation.viewmodel

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import org.osmdroid.util.GeoPoint
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor() : ViewModel() {

    private var _mapCenter: GeoPoint = GeoPoint(49.9935, 36.2304)
    val mapCenter: GeoPoint get() = _mapCenter

    private var _zoomLevel: Double = 12.0
    val zoomLevel: Double get() = _zoomLevel

    fun saveMapState(center: GeoPoint, zoom: Double) {
        _mapCenter = center
        _zoomLevel = zoom
    }
}