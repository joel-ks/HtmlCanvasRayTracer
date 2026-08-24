pipeline {
    agent any

    stages {
        stage ("Build") {
            steps {
                checkout scm

                script {
                    docker.build("webcanvasrt/rust", "--target rust .")
                    docker.build("webcanvasrt/node", "--target node .")
                }
            }
        }

        stage ("Run tests") {
            steps {
                script {
                    docker.image("webcanvasrt/rust").inside("--rm")
                    {
                        dir(path: "/usr/src/rust") {
                            sh "cargo test --profile release --lib"
                        }
                    }

                    sh "docker image rm ${testrunnerImg.imageName()}"
                }
            }
        }

        stage("Archive") {
            when {
                not { branch 'master' }
            }

            steps {
                script {
                    docker.image("webcanvasrt/node")
                        .inside("--rm --mount type=bind,src=./dist,dst=/usr/src/dist,bind-create-src")
                        {
                            dir(path: "/usr/src") {
                                sh "npm run bundle"
                            }
                        }

                    sh "docker image rm ${bundleImg.imageName()}"
                }

                archiveArtifacts artifacts: "dist/**", onlyIfSuccessful: true
            }
        }

        stage("Publish") {
            when {
                branch 'master'
            }

            steps {
                script {
                    docker.image("webcanvasrt/node")
                        .inside("--rm --mount type=bind,src=./dist,dst=/usr/src/dist,bind-create-src")
                        {
                            dir(path: "/usr/src") {
                                sh "npm run bundle"
                            }
                        }

                    sh "docker image rm ${bundleImg.imageName()}"
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

    post {
        cleanup {
            sh "docker image rm webcanvasrt/node webcanvasrt/rust"
        }
    }
}
