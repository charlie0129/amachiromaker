#!/bin/bash

#+-------------------------------------------------------------------------
#
#  server-app-runner
#
#  Repository: https://github.com/charlie0129/server-app-runner
#
#  Charlie Chiang
#
#--------------------------------------------------------------------------

# Variables that you may need to edit will have comments that starts with `----`

# Colors
export BOLD="\033[1m"
export GREY="\033[1;30m"
export RED="\033[1;31m"
export GREEN="\033[1;32m"
export YELLOW="\033[1;33m"
export BLUE="\033[1;34m"
export OFF="\033[m"
export HEADER_INFO="${BLUE}[INFO]$OFF "
export HEADER_WARN="${YELLOW}[WARN]$OFF "
export HEADER_ERROR="${RED}[ERROR]$OFF "

# The file used to store the pid of a previously started background process
export PID_FILE_NAME="started_process.pid"

# Default states
# Skip the build process in `start`
export SKIP_BUILD=false
# Run in the background (similar to -d/--detach in `Docker`)
export DETACH=false
# Print debug messages
export VERBOSE=false

# [Customizable]
# ---- The directory that contains the runner scripts (like `runner_scripts_prod`, etc.)
# You can also define RUNNER_SCRIPT_DIR in .env file
RUNNER_SCRIPT_DIR="."

# Parse arguments (only parse --verbose)
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
    -v | --verbose)
        VERBOSE=true
        shift
        ;;
    *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
done

# restore positional parameters
set -- "${POSITIONAL[@]}"

# Load .env (always loads)
if [ -f ".env" ]; then
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}loading environment variables from .env"
    fi
    export $(echo $(cat ".env" | sed 's/#.*//g' | xargs) | envsubst)
fi

# Load .env.local (always loads)
if [ -f ".env.local" ]; then
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}loading environment variables from .env.local"
    fi
    export $(echo $(cat ".env.local" | sed 's/#.*//g' | xargs) | envsubst)
fi

# Append a `/`
RUNNER_SCRIPT_DIR+="/"
# List environments in ${RUNNER_SCRIPT_DIR} (directory), e.g. ENV_LIST = [dev, prod, test]
ENV_LIST=$(ls -d ${RUNNER_SCRIPT_DIR}runner_scripts_* 2>/dev/null)
if [ "${ENV_LIST}" = "" ]; then
    echo -e "${HEADER_ERROR}Missing runner scripts. You must have runner scripts for at least one environment."
    exit 1
fi
ENV_LIST=${ENV_LIST[@]//${RUNNER_SCRIPT_DIR}runner_scripts_/}
ENV_LIST=(${ENV_LIST})

# [Customizable] predefine some variables
# ---- Fallback environment if no env is specified by the user (by default is the first one in the env list)
# You can also define DEFAULT_ENV in .env file
if [[ -z "${DEFAULT_ENV}" ]]; then
    DEFAULT_ENV=${ENV_LIST[0]}
fi

function usage() {
    echo -e "server-app-runner"
    echo -e ""
    echo -e "./runner.sh start | build | stop | update [environment] [-d | --detach] [--skip-build] [-v | --verbose] [--file env] [-h | --help]"
    echo -e "\t start:        build your project, stop a previous process, then start a new one"
    echo -e "\t build:        build your project"
    echo -e "\t stop:         stop a previously started background process"
    echo -e "\t update:       update your project"
    echo -e "\t environment:  your custom script environments, like dev, prod, etc."
    echo -e "\t --skip-build: skip build process when during \"start\""
    echo -e "\t -d --detach:  start project in the background and return"
    echo -e "\t -v --verbose: turn on verbose mode"
    echo -e "\t --file:       choose env file"
    echo -e "\t -h --help:    show this help and exit"
    echo -e ""
}

# Check if an array contains a certain element (helper function)
containsElement() {
    local e match="$1"
    shift
    for e; do [[ "$e" == "$match" ]] && return 0; done
    return 1
}

# Check if a string is a valid environment
check_is_valid_env() {
    # if $1 is in ENV_LIST
    if containsElement "$1" "${ENV_LIST[@]}"; then
        return 0
    fi

    case $1 in
    "" | --skip-build | -d | --detach | -v | --verbose | --file)
        return 1
        ;;
    *)
        echo -e "${HEADER_ERROR}Unknown environment: ${YELLOW}$1${OFF}. Available environment(s): ${GREEN}${ENV_LIST[@]}${OFF}"
        exit 1
        ;;
    esac
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
    start)
        COMMAND=start
        RUNNER_ENV="$2"
        check_is_valid_env "$2" && shift
        shift
        ;;
    build)
        COMMAND=build
        RUNNER_ENV="$2"
        check_is_valid_env "$2" && shift
        shift
        ;;
    stop)
        COMMAND=stop
        RUNNER_ENV="$2"
        check_is_valid_env "$2" && shift
        shift
        ;;
    update)
        COMMAND=update
        RUNNER_ENV="$2"
        check_is_valid_env "$2" && shift
        shift
        ;;
    --file)
        # Load user specified env file
        if [ -f "$2" ]; then
            if [ "${VERBOSE}" = true ]; then
                echo -e "${HEADER_INFO}loading environment variables from $2"
            fi
            export $(echo $(cat "$2" | sed 's/#.*//g' | xargs) | envsubst)
        fi
        shift
        shift
        ;;
    --skip-build)
        SKIP_BUILD=true
        shift
        ;;
    -d | --detach)
        export DETACH=true
        shift
        ;;
    -h | --help)
        usage
        exit 0
        ;;
    *)
        echo -e "${HEADER_ERROR}Unknown argument: $1"
        echo ""
        usage
        exit 1
        ;;
    esac
done

# Check arguments
if [ "${SKIP_BUILD}" = true ] && [ "${COMMAND}" != start ]; then
    echo -e "${HEADER_ERROR}You can only pair --skip-build with \"start\""
    exit 1
fi

if [ "${DETACH}" = true ] && [ "${COMMAND}" != start ]; then
    echo -e "${HEADER_ERROR}You can only pair -d --detach with \"start\""
    exit 1
fi

# Check environments (the user's input)
# if the env is not valid, the default value (${DEFAULT_ENV}) is used
case $RUNNER_ENV in
"" | --skip-build | -d | --detach | -v | --verbose | --file)
    echo -e "${HEADER_WARN}No environment set, falling back to ${DEFAULT_ENV}"
    RUNNER_ENV=${DEFAULT_ENV}
    ;;
*)
    ENV_FILE=".env.${RUNNER_ENV}"
    ;;
esac

# Load .env.[mode] (only loads in that environment)
if [ -f "${ENV_FILE}" ]; then
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}loading environment variables from ${ENV_FILE}"
    fi
    export $(echo $(cat "${ENV_FILE}" | sed 's/#.*//g' | xargs) | envsubst)
fi

# Load .env.[mode].local (only loads in that environment)
if [ -f "${ENV_FILE}.local" ]; then
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}loading environment variables from ${ENV_FILE}.local"
    fi
    export $(echo $(cat "${ENV_FILE}.local" | sed 's/#.*//g' | xargs) | envsubst)
fi

# Show configuration (verbose option)
if [ "${VERBOSE}" = true ]; then
    echo -e "${HEADER_INFO}operation   = ${BLUE}${COMMAND}${OFF}"

    echo -e "${HEADER_INFO}environment = ${BLUE}${RUNNER_ENV}${OFF}"

    COLOR=$([ "${SKIP_BUILD}" = true ] && echo "${GREEN}" || echo "${GREY}")
    echo -e "${HEADER_INFO}skip_build  = ${COLOR}${SKIP_BUILD}${OFF}"

    COLOR=$([ "${DETACH}" = true ] && echo "${GREEN}" || echo "${GREY}")
    echo -e "${HEADER_INFO}detach      = ${COLOR}${DETACH}${OFF}"
fi

# Define some functions to run the scripts
handle_error() {
    echo -e "${HEADER_ERROR}$1 failed"
    exit 1
}

build() {
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}building..."
    fi
    bash ${RUNNER_SCRIPT_DIR}runner_scripts_"${RUNNER_ENV}"/build.sh || handle_error "build"
}

start() {
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}application starting..."
    fi
    bash ${RUNNER_SCRIPT_DIR}runner_scripts_"${RUNNER_ENV}"/start.sh || handle_error "start"
}

stop() {
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}stopping application..."
    fi
    bash ${RUNNER_SCRIPT_DIR}runner_scripts_"${RUNNER_ENV}"/stop.sh || handle_error "stop"
}

update() {
    if [ "${VERBOSE}" = true ]; then
        echo -e "${HEADER_INFO}updating application..."
    fi
    bash ${RUNNER_SCRIPT_DIR}runner_scripts_"${RUNNER_ENV}"/update.sh || handle_error "update"
}

# Actually run the scripts, according to different environments
case $COMMAND in
start)
    if [ "${SKIP_BUILD}" = false ]; then
        build
    fi
    stop
    start
    ;;
build)
    build
    ;;
stop)
    stop
    ;;
update)
    update
    ;;
*)
    echo -e "${HEADER_ERROR}You need to specify an operation"
    usage
    ;;
esac
