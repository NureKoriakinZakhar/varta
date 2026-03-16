package com.android.varta.domain.usecase

import com.android.varta.domain.model.DetailResponse
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.domain.repository.UserRepository
import java.util.Calendar
import javax.inject.Inject

class AddSoldierUseCase @Inject constructor(
    private val repository: UserRepository
) {

    suspend operator fun invoke(request: SoldierAddRequest): UiState<DetailResponse> {

        if (request.firstName.isBlank()) return UiState.Error("Вкажіть ім'я")
        if (request.lastName.isBlank()) return UiState.Error("Вкажіть прізвище")
        if (request.middleName.isBlank()) return UiState.Error("Вкажіть по батькові")
        if (request.rank.isBlank()) return UiState.Error("Вкажіть звання")

        if (request.birthDay !in 1..31) {
            return UiState.Error("Некоректний день народження (вкажіть від 1 до 31)")
        }

        if (request.birthMonth !in 1..12) {
            return UiState.Error("Некоректний місяць народження (вкажіть від 1 до 12)")
        }

        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        if (request.birthYear < 1920 || request.birthYear > currentYear) {
            return UiState.Error("Некоректний рік народження")
        }

        if (!isValidDateOccurrence(request.birthYear, request.birthMonth, request.birthDay)) {
            return UiState.Error("Вказана неіснуюча дата (наприклад, 31 число в цьому місяці)")
        }

        val age = calculateAge(request.birthYear, request.birthMonth, request.birthDay)

        if (age < 18) {
            return UiState.Error("Військовослужбовець повинен бути старше 18 років")
        }

        if (age >= 59) {
            return UiState.Error("Військовослужбовець повинен бути молодше 59 років")
        }

        if (request.iotSerial.isBlank()) return UiState.Error("Вкажіть серійний номер IoT")

        return repository.addSoldier(request)
    }

    private fun isValidDateOccurrence(year: Int, month: Int, day: Int): Boolean {
        val cal = Calendar.getInstance()
        cal.set(Calendar.YEAR, year)
        cal.set(Calendar.MONTH, month - 1)
        val maxDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        return day <= maxDay
    }

    private fun calculateAge(year: Int, month: Int, day: Int): Int {
        val today = Calendar.getInstance()
        val birthDate = Calendar.getInstance().apply {
            set(year, month - 1, day)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        var age = today.get(Calendar.YEAR) - birthDate.get(Calendar.YEAR)

        if (today.get(Calendar.MONTH) < birthDate.get(Calendar.MONTH) ||
            (today.get(Calendar.MONTH) == birthDate.get(Calendar.MONTH) &&
                    today.get(Calendar.DAY_OF_MONTH) < birthDate.get(Calendar.DAY_OF_MONTH))) {
            age--
        }
        return age
    }
}