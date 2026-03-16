package com.android.varta.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.model.soldier.SoldierDeleteRequest
import com.android.varta.domain.usecase.AddSoldierUseCase
import com.android.varta.domain.usecase.DeleteSoldierUseCase
import com.android.varta.domain.usecase.GetAllSoldierUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SoldierViewModel @Inject constructor(
    private val getAllSoldierUseCase: GetAllSoldierUseCase,
    private val deleteSoldierUseCase: DeleteSoldierUseCase,
    private val addSoldierUseCase: AddSoldierUseCase
): ViewModel() {

    private val _soldiersState = MutableStateFlow<UiState<List<Soldier>>>(UiState.Idle)
    private val _searchQuery = MutableStateFlow("")

    private val _deleteState = MutableStateFlow<UiState<DetailResponse>>(UiState.Idle)
    val deleteState: StateFlow<UiState<DetailResponse>> = _deleteState

    private val _addState = MutableStateFlow<UiState<DetailResponse>>(UiState.Idle)
    val addState: StateFlow<UiState<DetailResponse>> = _addState

    val soldiersState: StateFlow<UiState<List<Soldier>>> = combine(
        _soldiersState,
        _searchQuery
    ) { state, query ->
        if (state is UiState.Success && query.isNotBlank()) {
            val filteredList = state.data.filter { soldier ->
                soldier.fullName.contains(query, ignoreCase = true)
            }
            UiState.Success(filteredList)
        } else {
            state
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = UiState.Idle
    )

    fun getAllSoldier() {
        viewModelScope.launch {
            if (_soldiersState == UiState.Idle) {_soldiersState.value = UiState.Loading}
            val result = getAllSoldierUseCase()
            _soldiersState.value = result
        }
    }

    fun deleteSoldier(request: SoldierDeleteRequest) {
        viewModelScope.launch {
            _deleteState.value = UiState.Loading
            _deleteState.value = deleteSoldierUseCase(request)
        }
    }

    fun addSoldier(request: SoldierAddRequest) {
        viewModelScope.launch {
            _addState.value = UiState.Loading
            _addState.value = addSoldierUseCase(request)
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }
}