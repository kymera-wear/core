{
  pkgs ? import <nixpkgs> {},
  stdenv ? pkgs.stdenv,
  chrootenv ? pkgs.callPackage <nixpkgs/pkgs/build-support/build-fhs-userenv/chrootenv> {},

  buildEnv ? pkgs.buildEnv,
  mkDerivation ? stdenv.mkDerivation,
  mkShell ? pkgs.mkShell,

  makeLibraryPath ? stdenv.lib.makeLibraryPath,

  is64bit ? stdenv.is64bit,

  optionalString ? pkgs.lib.optionalString,
  writeScript ? pkgs.writeScript,

  coreutils ? pkgs.coreutils,
  glibc ? pkgs.glibc,
  glibc32 ? pkgs.pkgsi686Linux.glibc,
}:

let
  fhs-init = writeScript "fhs-init" ''
    #! ${stdenv.shell}
    cd $FHS_PWD
    for path in ${fhs-lib}/* /host/*; do
      out="/''${path##*/}"
      [ -e "$out" ] || ${coreutils}/bin/ln -s "$path" "$out"
    done
    exec zsh
  '';

  fhs-lib = mkDerivation {
    name = "fhs-lib";

    buildCommand = ''
      mkdir -p -m0755 $out
      ln -s ${glibc32}/lib $out/lib32
      ${optionalString (is64bit) "ln -s ${glibc}/lib $out/lib64"}
      ln -s $out/lib${if is64bit then "64" else "32"} $out/lib
    '';
  };
in
  mkShell rec {
    buildInputs = with pkgs;
      atomEnv.packages ++
      [
        libuv
        v8
        gtk3-x11
        at-spi2-atk
        nodejs-8_x
        (yarn.override { nodejs = nodejs-8_x; })
      ];

    shellHook = ''
      export PATH="$PWD/node_modules/.bin/:$PATH"
      export NODE_ENV=development
      export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${makeLibraryPath buildInputs}
      export FHS_PWD=$PWD
      export CXXFLAGS=-I${pkgs.nodejs-8_x}/include/node
      exec ${chrootenv} ${fhs-init}
    '';
  }
