require("cmp_nvim_lsp").default_capabilities()
vim.lsp.enable("clangd")
vim.lsp.enable("pyright")
vim.lsp.enable("lua_ls")
vim.diagnostic.config({
    virtual_text = true
})

