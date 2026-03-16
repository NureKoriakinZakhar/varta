package com.android.varta.data.repository

import com.android.varta.data.local.TokenManager
import com.android.varta.data.remote.UserApi
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
import com.android.varta.domain.repository.UserRepository
import kotlinx.coroutines.flow.firstOrNull
import org.json.JSONObject
import javax.inject.Inject

class UserRepositoryImpl @Inject constructor(
    private val api: UserApi,
    private val tokenManager: TokenManager
) : UserRepository {

    override suspend fun login(request: LoginRequest): UiState<LoginResponse> {
        return try {
            val response = api.login(request.username, request.password)

            if (response.isSuccessful) {
                response.body()?.let { response ->
                    if (response.role == "army_unit") {
                        tokenManager.saveToken(response.accessToken)
                        UiState.Success(response)
                    } else {
                        UiState.Error("Невірний email або пароль")
                    }
                } ?: UiState.Error("Помилка мережі, спробуйте ще раз")
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка мережі, спробуйте ще раз"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun getAllSoldier(): UiState<List<Soldier>> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.getAllSoldier("Bearer $token")

            if (response.isSuccessful) {
                response.body()?.let { response ->
                    UiState.Success(response)
                } ?: UiState.Error("Помилка мережі, спробуйте ще раз")
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка мережі, спробуйте ще раз"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun getAllPoint(): UiState<List<Point>> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.getAllPoint("Bearer $token")

            if (response.isSuccessful) {
                response.body()?.let { response ->
                    UiState.Success(response)
                } ?: UiState.Error("Помилка мережі, спробуйте ще раз")
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка мережі, спробуйте ще раз"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun deleteSoldier(request: SoldierDeleteRequest): UiState<DetailResponse> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.deleteSoldier("Bearer $token", request)

            if (response.isSuccessful) {
                val detailResponse = response.body() ?: DetailResponse("Успішно видалено")
                UiState.Success(detailResponse)
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка видалення"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun deletePoint(request: PointDeleteRequest): UiState<DetailResponse> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.deletePoint("Bearer $token", request)

            if (response.isSuccessful) {
                val detailResponse = response.body() ?: DetailResponse("Успішно видалено")
                UiState.Success(detailResponse)
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка видалення"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun addSoldier(request: SoldierAddRequest): UiState<DetailResponse> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.addSoldier("Bearer $token", request)

            if (response.isSuccessful) {
                val detailResponse = response.body() ?: DetailResponse("Успішно додано")
                UiState.Success(detailResponse)
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка додавання"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }

    override suspend fun addPoint(request: PointAddRequest): UiState<DetailResponse> {
        return try {
            val token = tokenManager.accessToken.firstOrNull() ?: ""
            val response = api.addPoint("Bearer $token", request)

            if (response.isSuccessful) {
                val detailResponse = response.body() ?: DetailResponse("Успішно додано")
                UiState.Success(detailResponse)
            } else {
                val errorJson = response.errorBody()?.string()
                val errorMessage = try {
                    JSONObject(errorJson).getString("detail")
                } catch (e: Exception) {
                    "Помилка додавання"
                }
                UiState.Error(errorMessage)
            }
        } catch (e: Exception) {
            UiState.Error("Помилка мережі, спробуйте ще раз")
        }
    }
}