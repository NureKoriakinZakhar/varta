package com.android.varta.data.remote

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.LoginResponse
import com.android.varta.domain.model.point.Point
import com.android.varta.domain.model.point.PointAddRequest
import com.android.varta.domain.model.point.PointDeleteRequest
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.model.soldier.SoldierDeleteRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.Header
import retrofit2.http.POST

interface UserApi {
    @FormUrlEncoded
    @POST("auth/login")
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String
    ): Response<LoginResponse>

    @GET("/army_units/all_soldiers")
    suspend fun getAllSoldier(
        @Header("Authorization") token: String
    ): Response<List<Soldier>>

    @GET("/army_units/all_points")
    suspend fun getAllPoint(
        @Header("Authorization") token: String
    ): Response<List<Point>>

    @HTTP(method = "DELETE", path = "/army_units/delete_soldier", hasBody = true)
    suspend fun deleteSoldier(
        @Header("Authorization") token: String,
        @Body request: SoldierDeleteRequest
    ): Response<DetailResponse>

    @HTTP(method = "DELETE", path = "/army_units/delete_evacuation_point", hasBody = true)
    suspend fun deletePoint(
        @Header("Authorization") token: String,
        @Body request: PointDeleteRequest
    ): Response<DetailResponse>

    @POST("/army_units/add_soldier")
    suspend fun addSoldier(
        @Header("Authorization") token: String,
        @Body request: SoldierAddRequest
    ): Response<DetailResponse>

    @POST("/army_units/add_evacuation_point")
    suspend fun addPoint(
        @Header("Authorization") token: String,
        @Body request: PointAddRequest
    ): Response<DetailResponse>
}