import UIKit
import Capacitor

/// UIScene lifecycle entry (required by recent Xcode / Capacitor 8.5 templates).
///
/// Note: Capacitor's npm sources define `SceneDelegateProxy`, but the
/// `capacitor-swift-pm` 8.5.0 XCFramework used by SPM does not export it yet.
/// Deep-link / universal-link forwarding uses `ApplicationDelegateProxy` instead
/// (same notifications plugins already listen for).
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        // Defer until after the bridge is up (mirrors SceneDelegateProxy behavior).
        DispatchQueue.main.async {
            self.forwardOpenURLContexts(connectionOptions.urlContexts)
            for userActivity in connectionOptions.userActivities {
                self.forwardUserActivity(userActivity)
            }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        forwardOpenURLContexts(URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forwardUserActivity(userActivity)
    }

    private func forwardOpenURLContexts(_ URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
            if let sourceApplication = context.options.sourceApplication {
                options[.sourceApplication] = sourceApplication
            }
            if let annotation = context.options.annotation {
                options[.annotation] = annotation
            }
            options[.openInPlace] = context.options.openInPlace
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: context.url,
                options: options
            )
        }
    }

    private func forwardUserActivity(_ userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: { _ in }
        )
    }
}
