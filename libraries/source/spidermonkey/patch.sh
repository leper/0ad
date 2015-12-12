#!/bin/sh
# Apply patches if needed
# This script gets called from build-osx-libs.sh and build.sh.

# Fix the version specification code which used PYTHON before it was set.
# The second patch is required to not add autoconf as a dependency.
patch -p1 < ../FixVersionDetection.diff
patch -p1 < ../FixVersionDetectionConfigure.diff
