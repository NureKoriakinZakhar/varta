package com.android.varta.domain.repository

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.LoginRequest
import com.android.varta.domain.model.LoginResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.Point
import com.android.varta.domain.model.point.PointAddRequest
import com.android.varta.domain.model.point.PointDeleteRequest
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.model.soldier.SoldierDeleteRequest

interface UserRepository {
    suspend fun login(request: LoginRequest): UiState<LoginResponse>

    suspend fun getAllSoldier(): UiState<List<Soldier>>

    suspend fun getAllPoint(): UiState<List<Point>>

    suspend fun deleteSoldier(request: SoldierDeleteRequest): UiState<DetailResponse>
    suspend fun deletePoint(request: PointDeleteRequest): UiState<DetailResponse>

    suspend fun addSoldier(request: SoldierAddRequest): UiState<DetailResponse>

    suspend fun addPoint(request: PointAddRequest): UiState<DetailResponse>
}