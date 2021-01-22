# EpiLink

This repository contains the code used to power the EpiLink bot installed
on several Epitech-official Discord servers.

It firstly aim to link the Discord users to the Office 365 ones provided by
Epitech. Some may add some commands to ease their pedagogical processes.

## Usage

This bot use Typescript and the NestJs framework.

You first need to setup your environment by copying the `.envrc.example`
file and filling the blanks.

The `data.example.json` shows a template of the Discord settings, as one
bot instance could manage several Discord servers (while sharing the
same database to simplify the authentication process).

**The database will not be shared to any.**

## Contributing

A straightforward command mechanism is in place. See [auth.command.ts](https://github.com/IamBlueSlime/EpiLink/blob/main/src/commands/auth.command.ts)
for an exemple. Contribution from Epitech students or pedagogical assistants
(miss you guys) are welcome!

## License

This project is [MIT licensed](LICENSE.txt).

## Authors

|                                                      Jérémy Levilain                                                       |
| :------------------------------------------------------------------------------------------------------------------------: |
| ![Jérémy Levilain](https://avatars2.githubusercontent.com/u/6763873?s=100&u=556a37811b42f5528fba0b224e321269c0d77c92&v=4)  |
| [GitHub](https://github.com/iamblueslime) - [Website](https://jeremylvln.fr) - [Twitter](https://twitter.com/iamblueslime) |
