package com.android.varta.domain.model.point

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Point(
    @SerializedName("id")
    val id: Int,
    @SerializedName("name")
    val name: String,
    @SerializedName("coordinates")
    val coordinates: String,
    @SerializedName("description")
    val description: String
): Serializable