package com.android.varta.domain.model.soldier

import com.google.gson.annotations.SerializedName

data class SoldierAddRequest (
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("middle_name")
    val middleName: String,
    @SerializedName("birth_year")
    val birthYear: Int,
    @SerializedName("birth_month")
    val birthMonth: Int,
    @SerializedName("birth_day")
    val birthDay: Int,
    @SerializedName("rank")
    val rank: String,
    @SerializedName("iot_serial")
    val iotSerial: String
)
