call yarn build
rmdir /s /q submission
del submission.zip
mkdir submission
mkdir submission\release
xcopy /e dist\* submission\release
mkdir submission\src
mkdir submission\src\src
mkdir submission\src\assets
xcopy /e src\* submission\src\src
xcopy /e assets\* submission\src\assets
copy package*.*  submission\src
copy tsconfig*.* submission\src
copy webpack*.* submission\src
del /q submission\src\assets\music\*
echo Music is not creative commons > submission\license.txt
cd submission
"c:\Program Files\7-Zip\7z.exe" a ..\submission.zip *
cd ..