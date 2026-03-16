package com.android.varta.presentation.ui.activities

import android.app.Dialog
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.method.PasswordTransformationMethod
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.android.varta.R
import com.android.varta.databinding.ActivityLoginBinding
import com.android.varta.domain.model.LoginRequest
import com.android.varta.domain.model.LoginResponse
import com.android.varta.domain.model.UiState
import com.android.varta.presentation.ui.extensions.hideLoadingDialog
import com.android.varta.presentation.ui.extensions.showLoadingDialog
import com.android.varta.presentation.viewmodel.LoginViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private val loginViewModel: LoginViewModel by viewModels()

    private var _binding: ActivityLoginBinding? = null
    private val binding get() = _binding!!

    private var backPressedOnce = false
    private var isPasswordVisible = false

    private var loadingDialog: Dialog? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        _binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackPressedCustomHandler()
        setupUi()
        observeViewModel()
    }

    fun setupUi() {
        binding.login.setOnClickListener {
            val username: String = binding.username.text.toString().trim()
            val password: String = binding.password.text.toString().trim()

            binding.root.hideKeyboard()
            loginViewModel.login(LoginRequest(username, password))
        }

        binding.passwordToggle.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            val selection = binding.password.selectionStart

            if (isPasswordVisible) {
                binding.password.transformationMethod = null
                binding.passwordToggle.setImageResource(R.drawable.img_visible_password)
            } else {
                binding.password.transformationMethod = PasswordTransformationMethod.getInstance()
                binding.passwordToggle.setImageResource(R.drawable.img_unvisible_password)
            }

            binding.password.setSelection(selection)
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                loginViewModel.loginState.collect { state ->
                    handleLoadingState(state)

                    when (state) {
                        is UiState.Success -> {
                            navigateToHome()
                        }

                        is UiState.Error -> {
                            binding.username.setErrorStroke(true)
                            binding.password.setErrorStroke(true)
                            binding.error.text = state.detail
                            binding.error.isVisible = true
                        }

                        else -> {}
                    }
                }
            }
        }
    }

    private fun handleLoadingState(state: UiState<LoginResponse>) {
        if (state is UiState.Loading) {
            binding.username.setErrorStroke(false)
            binding.password.setErrorStroke(false)
            binding.error.isVisible = false

            if (loadingDialog == null) {
                loadingDialog = showLoadingDialog()
            }
        } else {
            hideLoadingDialog(loadingDialog)
            loadingDialog = null
        }
    }

    private fun navigateToHome() {
        if (isFinishing) return
        val intent = Intent(this, HomeActivity::class.java)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    private fun View.setErrorStroke(isError: Boolean) {
        val strokeWidth = if (isError) 2 else 0
        val strokeColor = ContextCompat.getColor(context, R.color.light_red)
        (background as? GradientDrawable)?.setStroke(strokeWidth, strokeColor)
    }

    fun View.hideKeyboard() {
        val imm = context.getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(windowToken, 0)
    }

    private fun setupBackPressedCustomHandler() {
        val callback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (backPressedOnce) {
                    finish()
                } else {
                    backPressedOnce = true
                    Toast.makeText(this@LoginActivity, getString(R.string.text_exit), Toast.LENGTH_SHORT).show()

                    binding.root.postDelayed({ backPressedOnce = false }, 2000)
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, callback)
    }

    override fun onDestroy() {
        super.onDestroy()
        hideLoadingDialog(loadingDialog)
        _binding = null
    }
}