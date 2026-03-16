package com.android.varta.presentation.ui.activities

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.navigation.fragment.NavHostFragment
import com.android.varta.R
import com.android.varta.databinding.ActivityHomeBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class HomeActivity : AppCompatActivity() {

    private var _binding: ActivityHomeBinding? = null
    private val binding get() = _binding!!

    private var backPressedOnce = false
    private lateinit var backPressedCallback: OnBackPressedCallback

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        _binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackPressedCustomHandler()
        setupUi()
    }

    private fun setupUi() {
        val navHostFragment = supportFragmentManager.findFragmentById(R.id.fragment_conainer_auth) as NavHostFragment
        val navController = navHostFragment.navController

        binding.navSoldiers.setOnClickListener { navController.navigate(R.id.fragment_soldier_list) }
        binding.navMap.setOnClickListener { navController.navigate(R.id.fragment_map) }
        binding.navPoints.setOnClickListener { navController.navigate(R.id.fragment_point_list) }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            when (destination.id) {
                R.id.fragment_soldier_list, R.id.fragment_map, R.id.fragment_point_list -> {
                    showNavBarSmoothly()
                    backPressedCallback.isEnabled = true

                    when (destination.id) {
                        R.id.fragment_soldier_list -> updateNavButtons(R.id.nav_soldiers)
                        R.id.fragment_map -> updateNavButtons(R.id.nav_map)
                        R.id.fragment_point_list -> updateNavButtons(R.id.nav_points)
                    }
                }
                else -> {
                    hideNavBarSmoothly()
                    backPressedCallback.isEnabled = false
                }
            }
        }
    }

    private fun showNavBarSmoothly() {
        if (binding.navBar.visibility == View.VISIBLE) return

        binding.navBar.apply {
            alpha = 0f
            translationY = 100f
            visibility = View.VISIBLE

            animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(250)
                .withEndAction(null)
                .start()
        }
    }

    private fun hideNavBarSmoothly() {
        if (binding.navBar.visibility == View.GONE) return

        binding.navBar.animate()
            .alpha(0f)
            .translationY(100f)
            .setDuration(250)
            .withEndAction {
                binding.navBar.visibility = View.GONE
            }
            .start()
    }

    private fun updateNavButtons(selectedId: Int) {
        val navButtons = listOf(binding.navSoldiers, binding.navMap, binding.navPoints)

        navButtons.forEach { layout ->
            if (layout.id == selectedId) {
                layout.setBackgroundResource(R.drawable.bg_nav_bar_select)
                layout.alpha = 1.0f
            } else {
                layout.background = null
                layout.alpha = 0.6f
            }
        }
    }

    private fun setupBackPressedCustomHandler() {
        backPressedCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (backPressedOnce) {
                    finish()
                } else {
                    backPressedOnce = true
                    Toast.makeText(this@HomeActivity, getString(R.string.text_exit), Toast.LENGTH_SHORT).show()

                    binding.root.postDelayed({ backPressedOnce = false }, 2000)
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, backPressedCallback)
    }

    override fun onDestroy() {
        super.onDestroy()
        _binding = null
    }
}