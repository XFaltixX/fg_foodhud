local dragEnabled = false

local function debugPrint(msg)
    if Config.DebugPrints then
        print("^0[^4FG DEV^0] ^3" .. msg .. "^0")
    end
end

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(3000)

        if Config.Framework == "esx" then
            TriggerEvent('esx_status:getStatus', 'hunger', function(hunger)
                TriggerEvent('esx_status:getStatus', 'thirst', function(thirst)
                    SendNUIMessage({
                        action = "updateStatus",
                        hunger = hunger.getPercent(),
                        thirst = thirst.getPercent()
                    })
                end)
            end)
        elseif Config.Framework == "qb" then
            local hunger = LocalPlayer.state.hunger or 0
            local thirst = LocalPlayer.state.thirst or 0

            SendNUIMessage({
                action = "updateStatus",
                hunger = hunger,
                thirst = thirst
            })
        end
    end
end)

RegisterCommand(Config.Commands.DragHUD, function()
    dragEnabled = not dragEnabled
    SetNuiFocus(dragEnabled, dragEnabled)
    SendNUIMessage({ action = dragEnabled and 'enableDrag' or 'disableDrag' })
end, false)

RegisterCommand(Config.Commands.ResetHUD, function()
    SendNUIMessage({ action = 'resetHUD' })
end, false)

RegisterNUICallback('closeUI', function(data, cb)
    dragEnabled = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'disableDrag' })
    cb('ok')
end)

if Config.UseChatSuggestions then
    TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.DragHUD, 'Verschiebt das HUD an die gewünschte Position')
    TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.ResetHUD, 'Setzt das HUD auf die Standardeinstellungen zurück')
end

debugPrint("Script started successfully!")
debugPrint("discord.gg/65Fr6AB6Vk")
