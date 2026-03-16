package com.android.varta.domain.usecase

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.PointAddRequest
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.repository.UserRepository
import java.util.Calendar
import javax.inject.Inject

class AddPointUseCase @Inject constructor(
    private val repository: UserRepository
) {

    suspend operator fun invoke(request: PointAddRequest): UiState<DetailResponse> {

        if (request.name.isBlank()) return UiState.Error("Вкажіть назву")
        if (request.description.isBlank()) return UiState.Error("Вкажіть опис")
        if (request.coordinates.isBlank()) return UiState.Error("Вкажіть точку на мапі")

        return repository.addPoint(request)
    }
}