package com.android.varta.domain.usecase

import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.domain.repository.UserRepository
import javax.inject.Inject

class GetAllSoldierUseCase @Inject constructor(private val repository: UserRepository) {

    operator suspend fun invoke(): UiState<List<Soldier>> {
        return repository.getAllSoldier()
    }
}