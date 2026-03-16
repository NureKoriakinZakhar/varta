package com.android.varta.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.varta.domain.model.LoginRequest
import com.android.varta.domain.model.LoginResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.usecase.LoginUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase
): ViewModel() {

    private val _loginState = MutableStateFlow<UiState<LoginResponse>>(UiState.Idle)
    val loginState: StateFlow<UiState<LoginResponse>> = _loginState

    fun login(request: LoginRequest) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading

            val result = loginUseCase(request)
            _loginState.value = result
        }
    }
}