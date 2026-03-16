package com.android.varta.domain.usecase

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.PointDeleteRequest
import com.android.varta.domain.repository.UserRepository
import javax.inject.Inject

class DeletePointUseCase @Inject constructor(private val repository: UserRepository) {

    operator suspend fun invoke(request: PointDeleteRequest): UiState<DetailResponse> {
        return repository.deletePoint(request)
    }
}