package com.android.varta.domain.usecase

import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.Point
import com.android.varta.domain.repository.UserRepository
import javax.inject.Inject

class GetAllPointUseCase @Inject constructor(private val repository: UserRepository) {

    operator suspend fun invoke(): UiState<List<Point>> {
        return repository.getAllPoint()
    }
}