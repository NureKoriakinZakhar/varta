package com.android.varta.domain.usecase

import com.android.varta.domain.model.LoginRequest
import com.android.varta.domain.model.LoginResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.repository.UserRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(private val repository: UserRepository) {

    operator suspend fun invoke(request: LoginRequest): UiState<LoginResponse> {
        if (request.username.isBlank() || request.password.isBlank()) {
            return UiState.Error("Будь ласка, заповніть усі поля")
        }

        if (!isEmailValid(request.username)) {
            return UiState.Error("Введіть коректну e-mail адресу")
        }

        return repository.login(request)
    }

    private fun isEmailValid(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}