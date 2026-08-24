pipeline {
    agent any

    stages {
        stage ("Build") {
            steps {
                checkout scm

                script {
                    docker.build("rust-base", "--target rust .")
                    docker.build("node-base", "--target node .")
                }
            }
        }

        stage ("Run tests") {
            steps {
                script {
                    def testrunnerImg = docker.build("rust-test", "--target rusttestrunner .")
                    testrunnerImg.run("--rm")
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
                    def bundleImg = docker.build("bundle", "--target bundler .")
                    bundleImg.run("--rm --mount type=bind,src=./dist,dst=/usr/src/dist,bind-create-src")
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
                    def bundleImg = docker.build("bundle", "--target bundler .")
                    bundleImg.run("--rm --mount type=bind,src=./dist,dst=/usr/src/dist,bind-create-src")
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
            sh "docker image rm node-base rust-base"
        }
    }
}
