{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "fibrobot";

  buildInputs = with pkgs; [
    python312
    python312Packages.fastapi
    python312Packages.uvicorn
    python312Packages.httpx
    python312Packages.pytest
    python312Packages.anyio
    python312Packages.python-dotenv
    python312Packages.anthropic
    ngrok
  ];

  shellHook = ''
    echo "🤖 fibrobot ready — run: uvicorn main:app --reload --port 3000"
  '';
}
