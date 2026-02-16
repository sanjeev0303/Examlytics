import React from "react";
import { Shield, Users, Server, Eye } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AdminIsland } from "./AdminIsland";

export const AdminSection = () => {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <AdminIsland />

        {/* Right: Copy */}
        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-brand-primary" />
            <span className="text-brand-primary font-bold uppercase text-sm">Enterprise Grade</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Trust, Scale & <br /> Admin Control.
          </h2>
          <p className="text-white/60 text-lg mb-8">
            &quot;Examlytics is not just an app. It’s an evolving AI system.&quot; <br className="my-2"/>
            Complete oversight for administrators to manage datasets, monitor model accuracy, and track user engagement in real-time.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Data Security", icon: Shield },
              { label: "Scalable Infra", icon: Server },
              { label: "User Analytics", icon: Users },
              { label: "Model Training", icon: Eye },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="p-2 bg-white/5 rounded-lg">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
