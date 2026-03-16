package com.android.varta.presentation.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.animation.AlphaAnimation
import android.view.animation.Animation
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.android.varta.R
import com.android.varta.data.local.TokenManager
import com.android.varta.databinding.ActivitySplashBinding
import dagger.hilt.android.AndroidEntryPoint
import jakarta.inject.Inject
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SplashActivity : AppCompatActivity() {

    @Inject
    lateinit var tokenManager: TokenManager

    private var _binding: ActivitySplashBinding? = null
    private val binding get() = _binding!!

    private var backPressedOnce = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        _binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackPressedCustomHandler()
        runEntranceAnimation()
    }

    private fun runEntranceAnimation() {
        val fadeIn = AlphaAnimation(0f, 1f).apply {
            duration = 1500
            fillAfter = true
        }

        binding.imgTrident.startAnimation(fadeIn)

        fadeIn.setAnimationListener(object : Animation.AnimationListener {
            override fun onAnimationStart(animation: Animation) {}

            override fun onAnimationEnd(animation: Animation) {
                binding.root.postDelayed({
                    checkAuthAndNavigate()
                }, 1000)
            }

            override fun onAnimationRepeat(animation: Animation) {}
        })
    }

    private fun checkAuthAndNavigate() {
        if (isFinishing) return
        lifecycleScope.launch {
            val token = tokenManager.accessToken.firstOrNull()

            if (!token.isNullOrEmpty()) {
                navigateToHome()
            } else {
                navigateToLogin()
            }
        }
    }

    private fun navigateToLogin() {
        if (isFinishing) return
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    private fun navigateToHome() {
        if (isFinishing) return
        val intent = Intent(this, HomeActivity::class.java)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    private fun setupBackPressedCustomHandler() {
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (backPressedOnce) {
                    finish()
                } else {
                    backPressedOnce = true
                    Toast.makeText(this@SplashActivity, getString(R.string.text_exit), Toast.LENGTH_SHORT).show()

                    binding.root.postDelayed({ backPressedOnce = false }, 2000)
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, callback)
    }

    override fun onDestroy() {
        super.onDestroy()
        _binding = null
    }
}