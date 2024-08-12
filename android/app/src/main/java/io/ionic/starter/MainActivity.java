package io.ionic.starter;

import android.net.http.SslError;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import android.util.Log;
public class MainActivity extends BridgeActivity {
    private static final String TAG = "KeyHandler";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = (WebView) this.bridge.getWebView();
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed(); // Ignore SSL certificate errors
            }
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        Log.d(TAG, "KeyDown: KeyCode = " + keyCode);
        if (keyCode == 104 ) {
            Log.d(TAG, "L2 Button Pressed");
            WebView webView = (WebView) this.bridge.getWebView();
            webView.evaluateJavascript("javascript:capturePhoto();", null);
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
