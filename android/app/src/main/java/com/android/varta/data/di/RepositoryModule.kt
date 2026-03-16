package com.android.varta.data.di

import com.android.varta.data.repository.UserRepositoryImpl
import com.android.varta.domain.repository.UserRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import jakarta.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}