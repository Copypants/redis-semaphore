#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CURDIR=$(pwd)

function usage {
	echo "Usage: $(basename $0) <newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease"
}

function bail {
  cd $CURDIR
  echo "Failed, exiting."
  exit 1
}

if [ -z "$1" ] || [ "$1" = "help" ]; then
	usage
	exit
fi

release=$1

if ! [ -z "$(git status --porcelain)" ]; then
  echo "Please commit staged files prior to bumping"
  exit 1
fi

# update to latest versions
git checkout master && git pull || bail
git checkout develop && git pull || bail

# bump npm version and app version
version=$(${DIR}/update-version.sh ${release})
if ! [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version update failed with: ${version}"
  exit 1
fi
echo "Updated version to: ${version}"

# commit version changes
if [ -f package-lock.json ]; then
   git add package-lock.json || bail
fi
git add package.json || bail
git commit -m "Updated version to $version" || bail

# do git release
git flow release start $version || bail

git flow release finish $version || bail

git push origin master || bail
git push --tags || bail
git checkout develop || bail
git push origin develop || bail
