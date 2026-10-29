//! Learn Rust : la leçon, l'éditeur et le terminal dans une seule fenêtre.
//!
//! Les commandes ci-dessous ne font que passer la main aux modules (`course`, `workspace`,
//! `verify`, `terminal`), qui portent la logique et ses tests. Les types TypeScript du front
//! sont générés depuis ces signatures par tauri-specta (voir `bindings()`).

mod course;
mod error;
mod terminal;
mod verify;
mod watcher;
mod workspace;

use std::path::PathBuf;

use tauri::ipc::Channel;
use tauri::{Manager, State};

use crate::course::{Lesson, Module};
use crate::error::AppResult;
use crate::terminal::Terminals;
use crate::verify::CheckResult;
use crate::watcher::Watcher;
use crate::workspace::Entry;

/// Le dossier `modules/` du cours. En dev, celui du repo ; `LEARN_RUST_COURSE` permet d'en
/// pointer un autre. L'embarquer dans l'app viendra avec le packaging.
fn course_root() -> PathBuf {
    std::env::var_os("LEARN_RUST_COURSE")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../modules"))
}

#[tauri::command]
#[specta::specta]
fn list_modules() -> AppResult<Vec<Module>> {
    course::list_modules(&course_root())
}

#[tauri::command]
#[specta::specta]
fn read_lesson(module_id: String, lesson_id: String) -> AppResult<Lesson> {
    course::read_lesson(&course_root(), &module_id, &lesson_id)
}

/// Un workspace imposé par `LEARN_RUST_WORKSPACE` : pratique en dev et pour les tests de bout en bout.
#[tauri::command]
#[specta::specta]
fn default_workspace() -> Option<String> {
    std::env::var("LEARN_RUST_WORKSPACE").ok()
}

#[tauri::command]
#[specta::specta]
fn list_dir(workspace: String, path: String) -> AppResult<Vec<Entry>> {
    workspace::list_dir(&PathBuf::from(workspace), &path)
}

#[tauri::command]
#[specta::specta]
fn list_files(workspace: String) -> AppResult<Vec<String>> {
    workspace::list_files(&PathBuf::from(workspace))
}

#[tauri::command]
#[specta::specta]
fn read_file(workspace: String, path: String) -> AppResult<String> {
    workspace::read_file(&PathBuf::from(workspace), &path)
}

#[tauri::command]
#[specta::specta]
fn write_file(workspace: String, path: String, content: String) -> AppResult<()> {
    workspace::write_file(&PathBuf::from(workspace), &path, &content)
}

#[tauri::command]
#[specta::specta]
fn create_file(workspace: String, path: String) -> AppResult<()> {
    workspace::create_file(&PathBuf::from(workspace), &path)
}

#[tauri::command]
#[specta::specta]
fn create_dir(workspace: String, path: String) -> AppResult<()> {
    workspace::create_dir(&PathBuf::from(workspace), &path)
}

#[tauri::command]
#[specta::specta]
fn rename_path(workspace: String, from: String, to: String) -> AppResult<()> {
    workspace::rename(&PathBuf::from(workspace), &from, &to)
}

#[tauri::command]
#[specta::specta]
fn delete_path(workspace: String, path: String) -> AppResult<()> {
    workspace::delete(&PathBuf::from(workspace), &path)
}

/// Prévient le front à chaque changement dans le workspace, d'où qu'il vienne.
#[tauri::command]
#[specta::specta]
fn watch_workspace(
    watcher: State<'_, Watcher>,
    workspace: String,
    on_change: Channel<Vec<String>>,
) -> AppResult<()> {
    watcher.watch(&PathBuf::from(workspace), move |paths| {
        let _ = on_change.send(paths);
    })
}

/// cargo peut prendre plusieurs secondes : on le lance hors du fil principal.
#[tauri::command]
#[specta::specta]
async fn check_project(workspace: String, project: String) -> AppResult<CheckResult> {
    let dir = workspace::resolve(&PathBuf::from(workspace), &project)?;
    tauri::async_runtime::spawn_blocking(move || verify::check_project(&dir))
        .await
        .map_err(|e| error::AppError::Io(e.to_string()))?
}

#[tauri::command]
#[specta::specta]
fn terminal_open(
    terminals: State<'_, Terminals>,
    workspace: String,
    cols: u16,
    rows: u16,
    on_output: Channel<String>,
) -> AppResult<u32> {
    terminals.spawn(&PathBuf::from(workspace), cols, rows, move |text| {
        let _ = on_output.send(text);
    })
}

#[tauri::command]
#[specta::specta]
fn terminal_write(terminals: State<'_, Terminals>, id: u32, data: String) -> AppResult<()> {
    terminals.write(id, &data)
}

#[tauri::command]
#[specta::specta]
fn terminal_resize(
    terminals: State<'_, Terminals>,
    id: u32,
    cols: u16,
    rows: u16,
) -> AppResult<()> {
    terminals.resize(id, cols, rows)
}

#[tauri::command]
#[specta::specta]
fn terminal_close(terminals: State<'_, Terminals>, id: u32) -> AppResult<()> {
    terminals.close(id)
}

/// La liste des commandes, partagée par l'app et par l'export des types TypeScript.
fn bindings() -> tauri_specta::Builder<tauri::Wry> {
    tauri_specta::Builder::<tauri::Wry>::new().commands(tauri_specta::collect_commands![
        list_modules,
        read_lesson,
        default_workspace,
        list_dir,
        list_files,
        read_file,
        write_file,
        create_file,
        create_dir,
        rename_path,
        delete_path,
        watch_workspace,
        check_project,
        terminal_open,
        terminal_write,
        terminal_resize,
        terminal_close,
    ])
}

/// Écrit `src/lib/bindings.ts`. Lancé par `cargo test` (voir le test plus bas) et au démarrage en dev.
pub fn export_bindings() {
    bindings()
        .export(
            specta_typescript::Typescript::default().header("// @ts-nocheck\n/* eslint-disable */"),
            concat!(env!("CARGO_MANIFEST_DIR"), "/../src/lib/bindings.ts"),
        )
        .expect("export des types TypeScript");
}

/// Le menu par défaut de macOS capte Cmd+W (fermer la fenêtre) et Cmd+Z (annuler) avant
/// la page. On garde le strict nécessaire pour que l'éditeur et le terminal reçoivent ces
/// raccourcis, comme dans VS Code : Cmd+W ferme l'onglet, Cmd+Z annule dans Monaco.
#[cfg(target_os = "macos")]
fn macos_menu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{MenuBuilder, SubmenuBuilder};
    let app_menu = SubmenuBuilder::new(app, "Learn Rust")
        .about(None)
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;
    // Copier, coller et tout sélectionner passent par le menu sur macOS : sans eux, ces
    // raccourcis ne marchent pas dans la webview.
    let edit = SubmenuBuilder::new(app, "Édition")
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;
    let window = SubmenuBuilder::new(app, "Fenêtre")
        .minimize()
        .maximize()
        .fullscreen()
        .build()?;
    MenuBuilder::new(app)
        .items(&[&app_menu, &edit, &window])
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = bindings();
    #[cfg(debug_assertions)]
    export_bindings();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Terminals::default())
        .manage(Watcher::default())
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            builder.mount_events(app);
            #[cfg(target_os = "macos")]
            app.set_menu(macos_menu(app.handle())?)?;
            let _ = app.get_webview_window("main");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de Learn Rust");
}

#[cfg(test)]
mod tests {
    /// Garde `src/lib/bindings.ts` à jour : `cargo test` régénère les types du front.
    #[test]
    fn export_typescript_bindings() {
        super::export_bindings();
    }
}
