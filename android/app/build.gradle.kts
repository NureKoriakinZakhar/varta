plugins {
    alias(libs.plugins.android.application)

    // Hilt
    id("com.google.devtools.ksp") version "2.3.2"
    id("com.google.dagger.hilt.android")

    alias(libs.plugins.androidx.navigation.safeargs)
}

android {
    namespace = "com.android.varta"
    compileSdk {
        version = release(36)
    }

    buildFeatures {
        viewBinding = true
    }

    defaultConfig {
        applicationId = "com.android.varta"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    // Retrofit & Networking
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.google.gson)
    implementation(libs.okhttp.logging)

    // Hilt
    implementation("com.google.dagger:hilt-android:2.59.1")
    ksp("com.google.dagger:hilt-compiler:2.59.1")

    // Room
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Data Store
    implementation(libs.androidx.datastore.preferences)

    // Lottie
    implementation(libs.airbnb.lottie)

    // Facebook
    implementation(libs.facebook.shimmer)

    // Map
    implementation(libs.osmdroid)
}