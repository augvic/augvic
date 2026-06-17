local dap = require("dap")
local dapui = require("dapui")
dap.adapters.python = {
    type = "executable",
    command = "python",
    args = { "-m", "debugpy.adapter" }
}
dap.configurations.python = {
    {
        type = "python",
        request = "launch",
        name = "Launch file",
        program = "${file}",
        pythonPath = function()
            return "python"
        end
    },
    {
        type = "python",
        request = "launch",
        name = "Launch module",
        module = function()
            return vim.fn.input("Module name: ")
        end
    }
}
dap.listeners.after.event_initialized["dapui_config"] = function()
    dapui.open()
end
dap.listeners.before.event_terminated["dapui_config"] = function()
    dapui.close()
end
dap.listeners.before.event_exited["dapui_config"] = function()
    dapui.close()
end
