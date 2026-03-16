package com.android.varta.domain.model.soldier

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class SoldierMetrics(
    @SerializedName("battery_percent")
    val batteryPercent: Int,
    @SerializedName("temperature")
    val temperature: Double,
    @SerializedName("heart_rate")
    val heartRate: Int,
    @SerializedName("last_update")
    val lastUpdate: String
): Serializable