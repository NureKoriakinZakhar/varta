package com.android.varta.presentation.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updateLayoutParams
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.android.varta.databinding.FragmentSoldierListBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.soldier.Soldier
import com.android.varta.presentation.adapter.SoldierAdapter
import com.android.varta.presentation.ui.extensions.showErrorDialog
import com.android.varta.presentation.viewmodel.SoldierViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SoldierListFragment : Fragment() {

    private val soldierViewModel: SoldierViewModel by activityViewModels()

    private var _binding: FragmentSoldierListBinding? = null
    private val binding get() = _binding!!

    private lateinit var soldierAdapter: SoldierAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSoldierListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        setupRecyclerView()
        observeViewModel()

        soldierViewModel.getAllSoldier()
    }

    private fun setupUI() {
        binding.add.setOnClickListener {
            val action = SoldierListFragmentDirections.actionSoldierListToAdd()
            findNavController().navigate(action)
        }

        ViewCompat.setOnApplyWindowInsetsListener(binding.soldiersList) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())

            view.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                bottomMargin = insets.bottom
            }

            windowInsets
        }

        binding.search.doOnTextChanged { text, _, _, _ ->
            val query = text?.toString() ?: ""
            soldierViewModel.updateSearchQuery(query)

            binding.cross.visibility = if (query.isNotEmpty()) View.VISIBLE else View.INVISIBLE
        }

        binding.cross.setOnClickListener {
            binding.search.text.clear()
            binding.search.clearFocus()

            val imm = requireContext().getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.hideSoftInputFromWindow(view?.windowToken, 0)
        }
    }

    private fun setupRecyclerView() {
        soldierAdapter = SoldierAdapter { soldier ->
            val action = SoldierListFragmentDirections.actionSoldierListToAbout(soldier)
            findNavController().navigate(action)
        }

        binding.soldiersList.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = soldierAdapter
            itemAnimator = null
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                soldierViewModel.soldiersState.collect { state ->
                    handleLoadingState(state)
                    when (state) {
                        is UiState.Success -> {
                            soldierAdapter.submitList(state.data)
                        }

                        is UiState.Error -> {
                            showErrorDialog { soldierViewModel.getAllSoldier() }
                        }

                        else -> {}
                    }
                }
            }
        }
    }

    private fun handleLoadingState(state: UiState<List<Soldier>>) {
        if (state is UiState.Loading) {
            binding.shimmerContainer.visibility = View.VISIBLE
            binding.shimmerContainer.startShimmer()
            binding.soldiersList.visibility = View.GONE
        } else {
            binding.shimmerContainer.stopShimmer()
            binding.shimmerContainer.visibility = View.GONE

            binding.soldiersList.visibility = View.VISIBLE
            binding.soldiersList.alpha = 1f
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}