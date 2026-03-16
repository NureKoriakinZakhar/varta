package com.android.varta.presentation.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.android.varta.R
import com.android.varta.databinding.ItemSoldierBinding
import com.android.varta.domain.model.soldier.Soldier

class SoldierAdapter(
    private val onItemClick: (Soldier) -> Unit
) : ListAdapter<Soldier, SoldierAdapter.SoldiersViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SoldiersViewHolder {
        val binding = ItemSoldierBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return SoldiersViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SoldiersViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class SoldiersViewHolder(private val binding: ItemSoldierBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: Soldier) {
            binding.name.text = item.fullName
            binding.rank.text = item.rank
            binding.birthDate.text = item.birthDate

            when(item.hospitalId) {
                null -> {
                    binding.location.setImageResource(R.drawable.img_soldier)
                    binding.location.setBackgroundResource(R.drawable.frame_blue)
                }
                else -> {
                    binding.location.setImageResource(R.drawable.img_medical)
                    binding.location.setBackgroundResource(R.drawable.frame_red)
                }
            }

            when(item.status) {
                "Good" -> {
                    binding.status.setImageResource(R.drawable.img_like)
                    binding.status.setBackgroundResource(R.drawable.frame_blue)
                }
                "Warning" -> {
                    binding.status.setImageResource(R.drawable.img_dislike)
                    binding.status.setBackgroundResource(R.drawable.frame_orange)
                }
                "Critical" -> {
                    binding.status.setImageResource(R.drawable.img_critical)
                    binding.status.setBackgroundResource(R.drawable.frame_red)
                }
                "На лікуванні" -> {
                    binding.status.setImageResource(R.drawable.img_medical)
                    binding.status.setBackgroundResource(R.drawable.frame_blue)
                }
                else -> {
                    binding.status.setImageResource(R.drawable.img_critical)
                    binding.status.setBackgroundResource(R.drawable.frame_red)
                }
            }

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    companion object DiffCallback : DiffUtil.ItemCallback<Soldier>() {
        override fun areItemsTheSame(oldItem: Soldier, newItem: Soldier): Boolean {
            return oldItem.soldierId == newItem.soldierId
        }

        override fun areContentsTheSame(oldItem: Soldier, newItem: Soldier): Boolean {
            return oldItem == newItem
        }
    }
}