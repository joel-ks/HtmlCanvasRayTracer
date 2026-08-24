pipeline {
    agent any

  stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
             steps {
                script {
                    docker.image('rust:1.98.0').inside('-u root') {
                        sh 'cargo install wasm-pack@^0.15' // NOTE: make custom base image with wasm-pack already installed?
                        sh 'wasm-pack build rust --release --target web'
                    }
                }

                script {
                    docker.image('node:lts').inside('-u root') {
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage ('Test') {
            steps {
                script {
                    docker.image('rust:1.98.0').inside('-u root') {
                        sh 'cargo test --manifest-path "rust/Cargo.toml" --profile release --lib'
                    }
                }
            }
        }

        stage('Archive') {
            when {
                not { branch 'master' }
            }

            steps {
                script {
                    docker.image('node:lts').inside('-u root') {
                        sh 'npm run bundle'
                    }
                }

                archiveArtifacts artifacts: 'dist/**', onlyIfSuccessful: true
            }
        }

        stage('Publish') {
            when {
                branch 'master'
            }

            steps {
                script {
                    docker.image('node:lts').inside('-u root') {
                        sh 'npm run bundle'
                    }
                }

                sshPublisher(publishers: [sshPublisherDesc(
                    configName: 'Rocinante',
                    transfers: [sshTransfer(
                        sourceFiles: 'dist/**',
                        removePrefix: 'dist/',
                        remoteDirectory: 'apps/raytracer',
                        cleanRemote: true,
                        excludes: '',
                        execCommand: '',
                        execTimeout: 120000,
                        flatten: false,
                        makeEmptyDirs: false,
                        noDefaultExcludes: false,
                        patternSeparator: '[, ]+',
                        remoteDirectorySDF: false,
                    )],
                    usePromotionTimestamp: false,
                    useWorkspaceInPromotion: false,
                    verbose: false
                )])
            }
        }
    }
}
