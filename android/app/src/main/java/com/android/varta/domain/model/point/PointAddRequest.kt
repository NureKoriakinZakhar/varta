package com.android.varta.domain.model.point

data class PointAddRequest(
    val name: String,
    val coordinates: String,
    val description: String
)