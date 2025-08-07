
{ pkgs }: {
  deps = [
    pkgs.nodejs-16_x
    pkgs.nodePackages.npm
    pkgs.yarn
    pkgs.nodePackages.typescript-language-server
    pkgs.replitPackages.jest
  ];
}
