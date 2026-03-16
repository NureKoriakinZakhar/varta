package com.android.varta.presentation.ui.extensions

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import androidx.annotation.StringRes
import androidx.fragment.app.Fragment
import com.airbnb.lottie.LottieAnimationView
import com.android.varta.R
import com.android.varta.databinding.DialogErrorBinding
import com.android.varta.databinding.DialogLoadingBinding
import com.android.varta.databinding.DialogQuestionBinding

fun Fragment.showErrorDialog(onRetry: () -> Unit) {
    val dialogBinding = DialogErrorBinding.inflate(LayoutInflater.from(requireContext()))

    val dialog = androidx.appcompat.app.AlertDialog.Builder(requireContext())
        .setView(dialogBinding.root)
        .setCancelable(false)
        .create()

    dialogBinding.btnDialogOk.setOnClickListener {
        onRetry()
        dialog.dismiss()
    }

    dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
    dialog.show()

    val displayMetrics = resources.displayMetrics
    val width = (displayMetrics.widthPixels * 0.85).toInt()

    dialog.window?.setLayout(
        width,
        android.view.ViewGroup.LayoutParams.WRAP_CONTENT
    )
}

fun Fragment.showQuestionDialog(
    @StringRes titleRes: Int,
    @StringRes messageRes: Int,
    @StringRes yesRes: Int,
    @StringRes noRes: Int,
    onPositive: () -> Unit
) {
    val dialogBinding = DialogQuestionBinding.inflate(LayoutInflater.from(requireContext()))

    val dialog = androidx.appcompat.app.AlertDialog.Builder(requireContext())
        .setView(dialogBinding.root)
        .setCancelable(false)
        .create()

    dialogBinding.tvDialogTitle.text = getString(titleRes)
    dialogBinding.tvDialogMessage.text = getString(messageRes)
    dialogBinding.btnYes.text = getString(yesRes)
    dialogBinding.btnNo.text = getString(noRes)

    dialogBinding.btnNo.setOnClickListener {
        dialog.dismiss()
    }

    dialogBinding.btnYes.setOnClickListener {
        onPositive()
        dialog.dismiss()
    }

    dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
    dialog.show()

    val displayMetrics = resources.displayMetrics
    val width = (displayMetrics.widthPixels * 0.85).toInt()
    dialog.window?.setLayout(width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT)
}

private fun Context.createLoadingDialog(): Dialog {
    val binding = DialogLoadingBinding.inflate(LayoutInflater.from(this))

    val dialog = Dialog(this)
    dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
    dialog.setContentView(binding.root)
    dialog.setCancelable(false)

    dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
    dialog.window?.setLayout(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
    )

    binding.root.alpha = 0f

    dialog.setOnShowListener {
        binding.root.animate()
            .alpha(1f)
            .setDuration(150)
            .start()
    }

    return dialog
}

fun Fragment.showLoadingDialog(): Dialog {
    val dialog = requireContext().createLoadingDialog()
    dialog.show()
    return dialog
}

fun Activity.showLoadingDialog(): Dialog {
    val dialog = createLoadingDialog()
    dialog.show()
    return dialog
}

fun hideLoadingDialog(dialog: Dialog?) {
    if (dialog == null || !dialog.isShowing) return

    val lottieView = dialog.findViewById<LottieAnimationView>(R.id.loading_lottie)
    val rootView = lottieView?.parent as? View

    if (rootView != null) {
        rootView.animate()
            .alpha(0f)
            .setDuration(150)
            .withEndAction {
                lottieView?.cancelAnimation()
                dialog.dismiss()
            }
            .start()
    } else {
        dialog.dismiss()
    }
}