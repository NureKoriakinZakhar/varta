package com.android.varta.presentation.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.android.varta.databinding.ItemPointBinding
import com.android.varta.domain.model.point.Point

class PointAdapter(
    private val onItemClick: (Point) -> Unit
) : ListAdapter<Point, PointAdapter.PointViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PointViewHolder {
        val binding = ItemPointBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return PointViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PointViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class PointViewHolder(private val binding: ItemPointBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: Point) {
            binding.id.text = "Точка #${item.id}"
            binding.name.text = item.name
            binding.coordinates.text = item.coordinates

            binding.root.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    companion object DiffCallback : DiffUtil.ItemCallback<Point>() {
        override fun areItemsTheSame(oldItem: Point, newItem: Point): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Point, newItem: Point): Boolean {
            return oldItem == newItem
        }
    }
}