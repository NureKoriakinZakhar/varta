package com.android.varta.domain.model.soldier

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Soldier(
    @SerializedName("soldier_id")
    val soldierId: Int,
    @SerializedName("full_name")
    val fullName: String,
    @SerializedName("birth_date")
    val birthDate: String,
    @SerializedName("rank")
    val rank: String,
    @SerializedName("iot_serial")
    val iotSerial: String,
    @SerializedName("status")
    val status: String,
    @SerializedName("coordinates")
    val coordinates: String?,
    @SerializedName("metrics")
    val metrics: SoldierMetrics?,
    @SerializedName("hospital_id")
    val hospitalId: Int?
): Serializable