#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CURDIR=$(pwd)

usage(){
  echo "Usage: $(basename $0) <newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease"
}

bail(){
  cd $CURDIR
  echo "Failed, exiting."
  exit 1
}

if [ -z "$1" ] || [ "$1" = "help" ]; then
	usage
	exit
fi

release=$1

# bump npm version
cd "${DIR}/.."
if ! [ -f "package.json" ]; then
  echo "Cannot find package.json file."
  bail
fi
output=$(npm version ${release} --no-git-tag-version)
if [ -z "$output" ]; then
	echo "Failed to update version"
	bail
fi
version=${output:1}

# done
cd $CURDIR
echo $version
