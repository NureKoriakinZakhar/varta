package com.android.varta.presentation.ui.fragments

import android.app.Dialog
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.android.varta.R
import com.android.varta.databinding.FragmentSoldierAddBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.SoldierAddRequest
import com.android.varta.presentation.ui.extensions.hideLoadingDialog
import com.android.varta.presentation.ui.extensions.showLoadingDialog
import com.android.varta.presentation.viewmodel.SoldierViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SoldierAddFragment : Fragment() {

    private val viewModel: SoldierViewModel by viewModels()

    private var _binding: FragmentSoldierAddBinding? = null
    private val binding get() = _binding!!

    private var loadingDialog: Dialog? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSoldierAddBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        binding.close.setOnClickListener { findNavController().popBackStack() }

        binding.add.setOnClickListener {
            val firstName = binding.firstName.text.toString().trim()
            val lastName = binding.lastName.text.toString().trim()
            val middleName = binding.middleName.text.toString().trim()
            val birthYear = binding.birthYear.text.toString().toIntOrNull() ?: 0
            val birthMonth = binding.birthMonth.text.toString().toIntOrNull() ?: 0
            val birthDay = binding.birthDay.text.toString().toIntOrNull() ?: 0
            val rank = binding.rank.text.toString().trim()
            val iotSerial = binding.iotSerial.text.toString().trim()

            binding.error.visibility = View.INVISIBLE

            viewModel.addSoldier(SoldierAddRequest(firstName, lastName, middleName, birthYear, birthMonth, birthDay, rank, iotSerial))
        }
    }
    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.addState.collect { state ->

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
                            binding.error.visibility = View.INVISIBLE
                            setError(false)
                            findNavController().popBackStack()
                        }
                        is UiState.Error -> {
                            binding.error.visibility = View.VISIBLE
                            binding.error.text = state.detail
                            setError(true)
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun setError(isError: Boolean) {
        binding.firstName.setErrorStroke(isError)
        binding.lastName.setErrorStroke(isError)
        binding.middleName.setErrorStroke(isError)
        binding.birthYear.setErrorStroke(isError)
        binding.birthMonth.setErrorStroke(isError)
        binding.birthDay.setErrorStroke(isError)
        binding.rank.setErrorStroke(isError)
        binding.iotSerial.setErrorStroke(isError)
    }


    private fun View.setErrorStroke(isError: Boolean) {
        val strokeWidth = if (isError) 2 else 0
        val strokeColor = ContextCompat.getColor(context, R.color.light_red)
        (background as? GradientDrawable)?.setStroke(strokeWidth, strokeColor)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        hideLoadingDialog(loadingDialog)
        loadingDialog = null
        _binding = null
    }
}