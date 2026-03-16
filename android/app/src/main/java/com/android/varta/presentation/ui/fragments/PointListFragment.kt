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
import com.android.varta.databinding.FragmentPointListBinding
import com.android.varta.domain.model.UiState
import com.android.varta.domain.model.point.Point
import com.android.varta.presentation.adapter.PointAdapter
import com.android.varta.presentation.ui.extensions.showErrorDialog
import com.android.varta.presentation.viewmodel.PointViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class PointListFragment : Fragment() {

    private val pointViewModel: PointViewModel by activityViewModels()

    private var _binding: FragmentPointListBinding? = null
    private val binding get() = _binding!!

    private lateinit var pointAdapter: PointAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentPointListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        setupRecyclerView()
        observeViewModel()

        pointViewModel.getAllPoint()
    }

    private fun setupUI() {
        binding.add.setOnClickListener {
            val action = PointListFragmentDirections.actionPointListToAdd()
            findNavController().navigate(action)
        }

        ViewCompat.setOnApplyWindowInsetsListener(binding.pointsList) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())

            view.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                bottomMargin = insets.bottom
            }

            windowInsets
        }

        binding.search.doOnTextChanged { text, _, _, _ ->
            val query = text?.toString() ?: ""
            pointViewModel.updateSearchQuery(query)

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
        pointAdapter = PointAdapter { evacuationPoint ->
            val action = PointListFragmentDirections.actionPointListToAbout(evacuationPoint)
            findNavController().navigate(action)
        }

        binding.pointsList.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = pointAdapter
            itemAnimator = null
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                pointViewModel.evacuationPointsState.collect { state ->
                    handleLoadingState(state)

                    when (state) {
                        is UiState.Success -> {
                            pointAdapter.submitList(state.data)
                        }

                        is UiState.Error -> {
                            showErrorDialog { pointViewModel.getAllPoint() }
                        }

                        else -> {}
                    }
                }
            }
        }
    }

    private fun handleLoadingState(state: UiState<List<Point>>) {
        if (state is UiState.Loading) {
            binding.shimmerContainer.visibility = View.VISIBLE
            binding.shimmerContainer.startShimmer()
            binding.pointsList.visibility = View.GONE
        } else {
            binding.shimmerContainer.stopShimmer()
            binding.shimmerContainer.visibility = View.GONE

            binding.pointsList.visibility = View.VISIBLE
            binding.pointsList.alpha = 1f
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}