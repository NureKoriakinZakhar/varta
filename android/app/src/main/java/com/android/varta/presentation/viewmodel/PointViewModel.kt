package com.android.varta.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.Point
import com.android.varta.domain.model.point.PointAddRequest
import com.android.varta.domain.model.point.PointDeleteRequest
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.usecase.AddPointUseCase
import com.android.varta.domain.usecase.DeletePointUseCase
import com.android.varta.domain.usecase.GetAllPointUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PointViewModel @Inject constructor(
    private val getAllPointUseCase: GetAllPointUseCase,
    private val deletePointUseCase: DeletePointUseCase,
    private val addPointUseCase: AddPointUseCase
): ViewModel() {

    private val _evacuationPointsState = MutableStateFlow<UiState<List<Point>>>(UiState.Idle)
    private val _searchQuery = MutableStateFlow("")

    private val _deleteState = MutableStateFlow<UiState<DetailResponse>>(UiState.Idle)
    val deleteState: StateFlow<UiState<DetailResponse>> = _deleteState

    private val _addState = MutableStateFlow<UiState<DetailResponse>>(UiState.Idle)
    val addState: StateFlow<UiState<DetailResponse>> = _addState

    val evacuationPointsState: StateFlow<UiState<List<Point>>> = combine(
        _evacuationPointsState,
        _searchQuery
    ) { state, query ->
        if (state is UiState.Success && query.isNotBlank()) {
            val filteredList = state.data.filter { point ->
                point.name.contains(query, ignoreCase = true)
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

    fun getAllPoint() {
        viewModelScope.launch {
            if (_evacuationPointsState == UiState.Idle) {_evacuationPointsState.value = UiState.Loading}
            val result = getAllPointUseCase()
            _evacuationPointsState.value = result
        }
    }

    fun deletePoint(request: PointDeleteRequest) {
        viewModelScope.launch {
            _deleteState.value = UiState.Loading
            _deleteState.value = deletePointUseCase(request)
        }
    }

    fun addPoint(request: PointAddRequest) {
        viewModelScope.launch {
            _addState.value = UiState.Loading
            _addState.value = addPointUseCase(request)
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }
}