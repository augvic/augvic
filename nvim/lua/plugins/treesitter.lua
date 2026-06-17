return {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
        require("nvim-treesitter.configs").setup({
            ensure_installed = {
                "lua",
                "vim",
                "vimdoc",
                "python",
                "cpp",
                "c",
                "bash",
                "markdown",
                "markdown_inline"
            },
            highlight = {
                enable = true
            },
            indent = {
                enable = true
            }
        })
    end
}
