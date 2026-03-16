package com.android.varta.presentation.ui.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import com.android.varta.R
import com.android.varta.databinding.FragmentSoldierAboutBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.SoldierDeleteRequest
import com.android.varta.presentation.ui.extensions.hideLoadingDialog
import com.android.varta.presentation.ui.extensions.showErrorDialog
import com.android.varta.presentation.ui.extensions.showLoadingDialog
import com.android.varta.presentation.ui.extensions.showQuestionDialog
import com.android.varta.presentation.viewmodel.SoldierViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SoldierAboutFragment : Fragment() {

    private val args: SoldierAboutFragmentArgs by navArgs()
    private val viewModel: SoldierViewModel by viewModels()

    private var _binding: FragmentSoldierAboutBinding? = null
    private val binding get() = _binding!!

    private var loadingDialog: Dialog? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSoldierAboutBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        binding.close.setOnClickListener { findNavController().popBackStack() }

        val soldier = args.soldier
        binding.apply {
            name.text = soldier.fullName ?: "-"
            rank.text = soldier.rank ?: "-"
            birthDate.text = soldier.birthDate ?: "-"
            status.text = soldier.status ?: "-"
            iotSerial.text = soldier.iotSerial ?: "-"

            if (soldier.metrics != null) {
                groupMetrics.visibility = View.VISIBLE
                metricsDetails.text = """
                Координати: ${soldier.coordinates ?: "-"}
                Батарея: ${soldier.metrics.batteryPercent ?: 0}%
                Температура: ${soldier.metrics.temperature ?: 0}°C
                Пульс: ${soldier.metrics.heartRate ?: 0}
            """.trimIndent()
            } else {
                groupMetrics.visibility = View.GONE
            }

            if (soldier.hospitalId != null) {
                groupHospital.visibility = View.VISIBLE
                hospitalId.text = soldier.hospitalId.toString()
            } else {
                groupHospital.visibility = View.GONE
            }

            delete.setOnClickListener {
                showQuestionDialog(
                    titleRes = R.string.dialog_delete_soldier_title,
                    messageRes = R.string.dialog_delete_soldier_message,
                    yesRes = R.string.dialog_delete_yes,
                    noRes = R.string.dialog_delete_no
                ) {
                    viewModel.deleteSoldier(SoldierDeleteRequest(soldier.soldierId))
                }
            }
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.deleteState.collect { state ->

                    if (state is UiState.Loading) {
                        if (loadingDialog == null) {
                            loadingDialog = showLoadingDialog()
                        }
                    } else {
                        hideLoadingDialog(loadingDialog)
                        loadingDialog = null
                    }

                    when (state) {
                        is UiState.Success -> {
                            findNavController().popBackStack()
                        }
                        is UiState.Error -> {
                            showErrorDialog {
                                viewModel.deleteSoldier(SoldierDeleteRequest(args.soldier.soldierId))
                            }
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        hideLoadingDialog(loadingDialog)
        loadingDialog = null
        _binding = null
    }
}