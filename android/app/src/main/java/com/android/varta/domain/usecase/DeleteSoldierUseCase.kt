package com.android.varta.domain.usecase

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.SoldierDeleteRequest
import com.android.varta.domain.repository.UserRepository
import javax.inject.Inject

class DeleteSoldierUseCase @Inject constructor(private val repository: UserRepository) {

    operator suspend fun invoke(request: SoldierDeleteRequest): UiState<DetailResponse> {
        return repository.deleteSoldier(request)
    }
}