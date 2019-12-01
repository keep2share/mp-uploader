#!groovy

pipeline {
    agent { label 'master' }
    options {
        buildDiscarder(logRotator(numToKeepStr: '2', artifactNumToKeepStr: '2'))
        timestamps()
    }
    stages {
        stage('Run docker container for build packages win and linux') { 
            steps {
                withCredentials([string(credentialsId: 'mp-uploader-publish', variable: 'GH_TOKEN')]) {
                sh "env| grep -iE 'GH_TOKEN|DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_' > env_for_docker "
                sh "docker run --rm -i --name mpFileUploader_build \
                    --env-file './env_for_docker' \
                    --env ELECTRON_CACHE='/root/.cache/electron' \
                    --env ELECTRON_BUILDER_CACHE='/root/.cache/electron-builder' \
                    -v '${WORKSPACE}':'/project' \
                    -v '/var/lib/jenkins/.cache/electron':'/root/.cache/electron' \
                    -v '/var/lib/jenkins/.cache/electron-builder':'/root/.cache/electron-builder' \
                    'electronuserland/builder:wine' \
                    /bin/bash -c 'cd /project && apt update && apt install -y npm && npm install electron-builder && snap install snapcraft --classic && npm i && yarn package-linux && echo BUILD_LINUX_COMPLETE!!!!!!!!! && yarn package-win && echo BUILD_WINDOWS_COMPLETE!!!!!!!!!'"
                }
            }
        }    
    }
}
